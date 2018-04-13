<template>
	<div class="standard-page">
		standard-page
		<header :msg="headerMsg"></header>
		<body :msg="headerMsg"></body>
	</div>
</template>
<script type="es6">
	'use strict';

	import header from '../widegt/header/index.widget.json';
	import body from '../widget/body/index.widget.json';

	export default {
		components: {
			header,
			body
		},
		data() {
			return {
				headerMsg: 'standard-header',
				bodyMsg: 'standard-body'
			};
		}
	};
</script>