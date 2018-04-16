<template>
	<div class="standard-page">
		standard-page
		<header :msg="storeData.tag"></header>
		<content :msg="storeData.tag"></content>
	</div>
</template>
<script type="es6">
	'use strict';

	import header from '../widget/header/index.widget.json';
	import content from '../widget/body/index.widget.json';

	export default {
		components: {
			header,
			content
		},
		data() {
			return {
				headerMsg: 'standard-header',
				bodyMsg: 'standard-body'
			};
		},
		computed: {
			storeData(state){
				return this.$store.state;
			}
		}
	};
</script>