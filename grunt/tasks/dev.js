module.exports = function (grunt, data)
{
	var tasks = [];

	tasks.push('browserify:dev');
	tasks.push('watch');

	grunt.registerTask('dev', 'Dev process.',tasks);
}