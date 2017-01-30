module.exports = {
	options: {
		outputStyle: 'nested',
		precision: 10
	},
	dev: {
		files: {
			'<%= paths.temp %>/angular-editor.css': '<%= paths.src %>/sass/main.scss'
		}
	},
	release: {
		options: {
			outputStyle: 'compressed'
		},
		files: {
			'<%= paths.temp %>/angular-editor.css': '<%= paths.src %>/sass/main.scss'
		}
	}
}