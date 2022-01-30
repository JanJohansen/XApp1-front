import db from "./ObjDbClient"

export default class TestDataGenerator {
	constructor() {
		// Create test data ---------------------------------------------------
		db.rSet("TestDataGenerator", {
			idx: { implements: ["node"] },
			ins: { in1: { description: "Node input." } },
			outs: { out1: { description: "Node output." } }
		})

		db.set("node2", {
			_$id: "node2",
			idx: { implements: ["node"] },
			ins: { in1: { description: "Node input." } },
			outs: { out1: { description: "Node output." } }
		})

		// Node type collection...
		db.set("index:implements:node", {
			_$id: "index:implements:node",
			type: "index",
			ids: {
				node1: {},
				node2: {}
			}
		})

		// Simulate variable object
		let c1 = 0
		setInterval(() => {
			db.rSet("TestDataGenerator.outs.out1", c1++)
		}, 2000)

		// let c3 = 1
		// setInterval(() => {
		// 	db.set("node2.outs.out1", c3++)
		// }, 200)
	}
}
