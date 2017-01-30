module.exports = {
	options: {
		map: false
	},
	dev: {
		options: {
			processors: [
				require('autoprefixer')({browsers: 'last 2 versions'})
			]
		},
		files: [{
			expand: true,
			cwd: '<%= paths.temp %>/',
			dest: '<%= paths.build %>/',
			src: '{,*/}*.css'
		}]
	},
	release: {
		options: {
			processors: [
				require('autoprefixer')({browsers: 'last 2 versions'}),
				require('cssnano')()
			]
		},
		files: [{
			expand: true,
			cwd: '<%= paths.temp %>/',
			dest: '<%= paths.dist %>/',
			src: '{,*/}*.css'
		}]
	}
}