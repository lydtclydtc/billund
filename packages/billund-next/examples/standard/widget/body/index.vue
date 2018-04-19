<template>
	<div class="standard-body">{{msg}}</div>
</template>
<script type="es6">
	console.log(window.me);
	export default {
		props: {
			msg: {
				type: String,
				default: 'fake message'
			}
		}
	}
</script>