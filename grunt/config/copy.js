module.exports = function (grunt, options)
{
	return {
		dist: {
			files: [
				{
					expand: true,
					cwd: '<%= options.src %>',
					dest: '<%= options.dist %>',
					src: ['*.js']
				}
			]
		},
		release: {
			files: [
				{
					expand: true,
					dot: true,
					cwd: '<%= options.src %>',
					dest: '<%= options.release %>/<%= options.version %>',
					src: ['*.js']
				}
			]
		}
	}
}