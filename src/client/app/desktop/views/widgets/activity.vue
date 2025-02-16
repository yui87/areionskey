<template>
<mk-activity
	:design="props.design"
	:initView="props.view"
	:user="$store.state.i"
	@viewChanged="viewChanged"
/>
</template>

<script lang="ts">
import define from '../../../common/define-widget';
export default define({
	name: 'activity',
	props: () => ({
		design: 0,
		view: 0
	})
}).extend({
	methods: {
		func() {
			if (this.props.design == 2) {
				this.props.design = 0;
			} else {
				this.props.design++;
			}
			this.save();
		},
		viewChanged(view) {
			this.props.view = view;
			this.save();
		}
	}
});
</script>
