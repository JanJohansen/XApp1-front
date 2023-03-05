<template>
	<table>
		<tr>
			<th align="left">Path</th>
			<th align="left">Value</th>
		</tr>
		<obj-row
			v-for="(obj, prop) in object"
			:prop="prop"
			:value="obj"
			:level="0"
			:tableSettings="{ propWidth: 200 }"
		/>
	</table>
</template>

<script setup lang="ts">
	import ObjRow from "./ObjectRow.vue"
	import { defineProps } from "vue"
	const props = defineProps(["object"])

	/*
        A.B.c = 42
        =
        Array   Tree        Val
        0 <->    A
        1 <->       B
        2 ->            c   42
        
        A.b = 42

        Array   Tree        Val
        0 <->    A
        1 ->        b       42
        2 <->       B
        3 ->            c   42
        Array   Tree        Val
        0 <->    A
        1 ->        b       42
        2 <->       B
        3 ->            c   42


    */
</script>
