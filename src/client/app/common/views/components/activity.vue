<template>
<div>
	<div ref="chart"></div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import ApexCharts from 'apexcharts';

export default Vue.extend({
	props: {
		user: {
			type: Object,
			required: true
		},
		limit: {
			type: Number,
			required: false,
			default: 21
		}
	},
	data() {
		return {
			fetching: true,
			data: [],
			peak: null
		};
	},
	mounted() {
		this.$root.api('charts/user/notes', {
			userId: this.user.id,
			span: 'day',
			limit: this.limit
		}).then(stats => {
			const normal = [];
			const reply = [];
			const renote = [];

			const now = new Date();
			const y = now.getFullYear();
			const m = now.getMonth();
			const d = now.getDate();

			for (let i = 0; i < this.limit; i++) {
				const x = new Date(y, m, d - i);
				normal.push([
					x,
					stats.diffs.normal[i]
				]);
				reply.push([
					x,
					stats.diffs.reply[i]
				]);
				renote.push([
					x,
					stats.diffs.renote[i]
				]);
			}

			const chart = new ApexCharts(this.$refs.chart, {
				chart: {
					type: 'bar',
					stacked: true,
					height: 100,
					sparkline: {
						enabled: true
					},
				},
				plotOptions: {
					bar: {
						columnWidth: '80%'
					}
				},
				dataLabels: {
					enabled: false
				},
				grid: {
					clipMarkers: false,
					padding: {
						top: 0,
						right: 8,
						bottom: 0,
						left: 8
					}
				},
				tooltip: {
					theme: this.$store.state.device.darkmode ? 'dark' : 'light',
					shared: true,
					intersect: false
				},
				series: [{
					name: 'Normal',
					data: normal
				}, {
					name: 'Reply',
					data: reply
				}, {
					name: 'Renote',
					data: renote
				}],
				xaxis: {
					type: 'datetime',
					crosshairs: {
						width: 1,
						opacity: 1
					}
				}
			});

			chart.render();
		});
	}
});
</script>
