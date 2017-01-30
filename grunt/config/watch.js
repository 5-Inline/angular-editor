module.exports = {
	options: {
		livereload: false
	},
	sass: {
		files: [
			'<%= paths.src %>/sass/**/*.{scss,sass}'
		],
		tasks: [
			'sass:dev',
			'postcss:dev'
		]
	}
}