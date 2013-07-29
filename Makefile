GENERATED_FILES = \
	ipy_node.js 

all: $(GENERATED_FILES)

copy_ipycli:
	@cat $(IPYTHON_DIR)/namespace.js > lib/ipython-browser.js
	@cat $(IPYTHON_DIR)/utils.js >> lib/ipython-browser.js
	@cat $(IPYTHON_DIR)/events.js >> lib/ipython-browser.js
	@cat $(IPYTHON_DIR)/kernel.js >> lib/ipython-browser.js

browserify:
	@brfs ./lib/kernel.js > ./lib/kernel-brfs.js
	@brfs ./lib/ipython-browserify.js > ./lib/ipython-browserify-brfs.js
	@browserify --ig -t brfs ./browser.js > ipy_node.js
