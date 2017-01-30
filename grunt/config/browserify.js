module.exports = function (grunt, data)
{
	return {
		dev: {		
			options: {
				watch: true,
				keepAlive: false
			},
			files: {
				'build/angular-editor.js': ['src/**/*.js']
			}
		}
	}
}