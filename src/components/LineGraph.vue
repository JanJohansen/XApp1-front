<template>
	<div id="graph" ref="graph"></div>
</template>

<style scoped>
	#graph {
		flex: 1 1 auto;
	}
</style>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, onUpdated, watchEffect, computed, watch } from "vue"
	import * as d3 from "d3"

	defineProps<{ msg: string }>()
	const count = ref(0)

	const graph = ref(null) // Will be overwritten by "self element" after initial render https://v3.vuejs.org/guide/composition-api-template-refs.html#template-refs

	let data = [
		{ v: 1, ts: 1 },
		{ v: 2, ts: 2 },
		{ v: 4, ts: 3 },
		{ v: 5, ts: 4 },
		{ v: 9, ts: 5 },
		{ v: 42, ts: 6 }
	]

	let width = 10
	let height = 10

	let getX = (d) => d.ts // given d in data, returns the (temporal) x-value
	let getY = (d) => d.v // given d in data, returns the (quantitative) y-value
	// defined, // for gaps in data
	let curve = d3.curveLinear, // method of interpolation between points
		marginTop = 30, // top margin, in pixels
		marginRight = 30, // right margin, in pixels
		marginBottom = 30, // bottom margin, in pixels
		marginLeft = 40, // left margin, in pixels
		xScaleType = d3.scaleLinear, // the x-scale type
		xDomain, // [xmin, xmax]
		yScaleType = d3.scaleLinear, // the y-scale type
		yDomain, // [ymin, ymax]
		// xRange = [marginLeft, width - marginRight], // [left, right]
		// yRange = [height - marginBottom, marginTop], // [bottom, top]
		yFormat, // a format specifier string for the y-axis
		yLabel = "Value", // a label for the y-axis
		color = "currentColor", // stroke color of line
		strokeLinecap = "round", // stroke line cap of the line
		strokeLinejoin = "round", // stroke line join of the line
		strokeWidth = 1.5, // stroke width of line, in pixels
		strokeOpacity = 1 // stroke opacity of line


	onMounted(() => {
		console.log("mounted!", graph.value) // .height.baseVal.value)

		// Handle automatic sizing and resizing...
		const resizeObserver = new ResizeObserver((entries) => {
			// console.log("RESIZED!", root)
			width = entries[0].contentRect.width
			height = entries[0].contentRect.height

			// xRange = [marginLeft, width - marginRight], // [left, right]
			// yRange = [height - marginBottom, marginTop], // [bottom, top]

			d3.select("#graph").select("svg").remove() // Remove graph if already drawn.
			draw()
		})
		resizeObserver.observe(graph.value)
	})

	let draw = () => {
		console.log("DRAWING:", graph.value)

		// Compute values nbased on dataset and getters for x and y.
		const X = d3.map(data, getX)
		const Y = d3.map(data, getY)

		// Domains
		if (xDomain === undefined) xDomain = d3.extent(X)
		if (yDomain === undefined) yDomain = [0, d3.max(Y)] //d3.extent(Y) // [d3.min(Y), d3.max(Y)]

		// Scales
		const xScale = xScaleType()
			.domain(xDomain)
			.range([0 + marginLeft, width - marginRight])
		const yScale = yScaleType()
			.domain(yDomain)
			.range([height - marginBottom, 0 + marginTop])

		// Axis
		const xAxis = d3.axisBottom(xScale).ticks(5)
		// .tickSizeOuter(0)
		const yAxis = d3.axisLeft(yScale).ticks(20, yFormat)

		// Line generator
		let defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i])
		const I = d3.range(X.length)
		const D = d3.map(data, defined)
		const line = d3
			.line()
			.defined((i) => D[i])
			.curve(curve)
			.x((i) => xScale(X[i]))
			.y((i) => yScale(Y[i]))

		const svg = d3.select("#graph").append("svg").attr("width", "100%").attr("height", "100%")

		svg
			.append("g")
			.attr("transform", `translate(0,${height - marginBottom})`)
			.call(xAxis)

		svg
			.append("g")
			.attr("transform", `translate(${marginLeft},0)`)
			.call(yAxis)
			.call((g) => g.select(".domain").remove()) // Remove yAxis horizontal Line
			.call((g) =>
				g
					.selectAll(".tick line")
					.clone()
					.attr("x2", width - marginLeft - marginRight)
					.attr("stroke-opacity", 0.1)
			)
			.call((g) => g.append("text").attr("x", -marginLeft).attr("y", 10).attr("fill", "currentColor").attr("text-anchor", "start").text(yLabel))

		svg
			.append("path")
			.attr("fill", "none")
			.attr("stroke", color)
			.attr("stroke-width", strokeWidth)
			.attr("stroke-linecap", strokeLinecap)
			.attr("stroke-linejoin", strokeLinejoin)
			.attr("stroke-opacity", strokeOpacity)
			.attr("d", line(I))
	}
</script>
