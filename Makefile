.PHONY: tests
tests:
	npx . -i tests/test.x3d -o tests/test.html

publish:
	node build/publish.js
