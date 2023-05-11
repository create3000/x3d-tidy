test:
	npm start -- -i tests/test.x3d -o tests/test.html

publish:
	perl build/publish.pl
