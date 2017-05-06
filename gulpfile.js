var gulp = require('gulp');

var livereload = require('gulp-livereload');

gulp.task('default', [], function(){
	livereload.listen();
	gulp.watch("*.html", function(){
		gulp.src("*.html").pipe(livereload());
	});
	gulp.watch("./styles/main.css", function(){
		gulp.src("./styles/main.css").pipe(livereload());
	});
	gulp.watch("./scripts/main.js", function(){
		gulp.src("./scripts/main.js").pipe(livereload());
	});
});