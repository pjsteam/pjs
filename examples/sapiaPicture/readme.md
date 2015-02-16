# Sepia Picture

The idea and some source code for this sample was taken from [here](http://blogs.msdn.com/b/eternalcoding/archive/2012/09/20/using-web-workers-to-improve-performance-of-image-manipulation.aspx)

To run the sample you must serve the **default*.html** file using a local server. Otherwise a CORS error is thrown when manipulating the image inside the canvas.

## Serve steps

1. If you don't have `serve` installed:
  * Run the command `npm install -g serve`
2. Open terminal and `cm` to this directory.
3. Run serve .
4. Open Chrome and browse `http://127.0.0.1:3000/`

## Sample description

* `defaultnoworker.html` executes the sample using web workers.
* `default-pjs.html` executes our sample implementation using web workers.
