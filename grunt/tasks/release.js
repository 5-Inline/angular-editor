module.exports = function (grunt, data)
{
	var tasks = [];

	tasks.push('clean:release');
	tasks.push('uglify:release');
	tasks.push('copy:release');
	tasks.push('string-replace:release');

	grunt.registerTask('rekease',' Build application for production release.', tasks);
}