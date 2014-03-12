GENERATED_FILES = \
	ipy_node.js 

all: $(GENERATED_FILES)

copy_ipython:
	@cat $(IPYTHON_STATIC_DIR)/base/js/namespace.js > lib/ipython-browser.js
	@cat $(IPYTHON_STATIC_DIR)/base/js/utils.js >> lib/ipython-browser.js
	@cat $(IPYTHON_STATIC_DIR)/base/js/events.js >> lib/ipython-browser.js
	@cat $(IPYTHON_STATIC_DIR)/services/kernels/js/comm.js >> lib/ipython-browser.js
	@cat $(IPYTHON_STATIC_DIR)/services/kernels/js/kernel.js >> lib/ipython-browser.js
	@cat $(IPYTHON_STATIC_DIR)/services/sessions/js/session.js >> lib/ipython-browser.js
	@cat lib/ipython-stubs.js >> lib/ipython-browser.js

browserify:
	@brfs ./lib/kernel.js > ./lib/kernel-brfs.js
	@brfs ./lib/ipython-browserify.js > ./lib/ipython-browserify-brfs.js
	@browserify --ig -t brfs ./browser.js > ipy_node.js
