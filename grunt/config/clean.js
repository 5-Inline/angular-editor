module.exports = function (grunt, options)
{
	return {
		options: {
			force: true
		},
		dist: [
			'<%= options.temp %>',
			'<%= options.dist %>'
		],
		release: [
			'<%= options.release %>/<%= pkg.version %>'
		]
	}
}