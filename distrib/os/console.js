/* ------------
     Console.ts

     The OS Console - stdIn and stdOut by default.
     Note: This is not the Shell. The Shell is the "command line interface" (CLI) or interpreter for this console.
     ------------ */
var TSOS;
(function (TSOS) {
    var Console = /** @class */ (function () {
        function Console(currentFont, currentFontSize, currentXPosition, currentYPosition, buffer) {
            if (currentFont === void 0) { currentFont = _DefaultFontFamily; }
            if (currentFontSize === void 0) { currentFontSize = _DefaultFontSize; }
            if (currentXPosition === void 0) { currentXPosition = 0; }
            if (currentYPosition === void 0) { currentYPosition = _DefaultFontSize; }
            if (buffer === void 0) { buffer = ""; }
            this.currentFont = currentFont;
            this.currentFontSize = currentFontSize;
            this.currentXPosition = currentXPosition;
            this.currentYPosition = currentYPosition;
            this.buffer = buffer;
        }
        Console.prototype.init = function () {
            this.clearScreen();
            this.resetXY();
        };
        Console.prototype.clearScreen = function () {
            _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
        };
        Console.prototype.resetXY = function () {
            this.currentXPosition = 0;
            this.currentYPosition = this.currentFontSize;
            TSOS.Control.resetCanvas();
        };
        Console.prototype.handleInput = function () {
            while (_KernelInputQueue.getSize() > 0) {
                // Get the next character from the kernel input queue.
                var chr = _KernelInputQueue.dequeue();
                // Check to see if it's "special" (enter or ctrl-c) or "normal" (anything else that the keyboard device driver gave us).
                if (chr === String.fromCharCode(13)) { // the Enter key
                    // The enter key marks the end of a console command, so ...
                    // ... tell the shell ...
                    if (this.buffer !== "") {
                        _OsShell.history.add(this.buffer);
                    }
                    _OsShell.handleInput(this.buffer);
                    // ... and reset our buffer.
                    this.buffer = "";
                }
                else if (chr === String.fromCharCode(8)) { // the Backspace key
                    this.deleteText(this.buffer.charAt(this.buffer.length - 1));
                    // Must remove the last character from the buffer. Note the use of "substring" rather than "substr"
                    this.buffer = this.buffer.substring(0, this.buffer.length - 1);
                }
                else if (chr === String.fromCharCode(9)) { // The TAB key
                    this.deleteText(this.buffer);
                    this.buffer = _OsShell.autoComplete(this.buffer) !== "" ? _OsShell.autoComplete(this.buffer) : this.buffer;
                    this.putText(this.buffer);
                }
                else if (chr === "up") { // The Up arrow
                    this.deleteText(this.buffer);
                    this.buffer = _OsShell.history.getCMD();
                    _OsShell.history.backward();
                    this.putText(this.buffer);
                }
                else if (chr === "down") { // The Down arrow
                    _OsShell.history.forward();
                    this.deleteText(this.buffer);
                    this.buffer = _OsShell.history.getCMD();
                    this.putText(this.buffer);
                }
                else {
                    // This is a "normal" character, so ...
                    // ... draw it on the screen...
                    this.putText(chr);
                    // ... and add it to our buffer.
                    this.buffer += chr;
                }
                // TODO: Add a case for Ctrl-C that would allow the user to break the current program.
            }
        };
        Console.prototype.putText = function (text) {
            /*  My first inclination here was to write two functions: putChar() and putString().
                Then I remembered that JavaScript is (sadly) untyped and it won't differentiate
                between the two. (Although TypeScript would. But we're compiling to JavaScipt anyway.)
                So rather than be like PHP and write two (or more) functions that
                do the same thing, thereby encouraging confusion and decreasing readability, I
                decided to write one function and use the term "text" to connote string or char.
            */
            if (text !== "") {
                // First attempt at advance line
                // If the next character
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                if (_Canvas.width - offset <= this.currentXPosition) {
                    this.advanceLine();
                }
                // Draw the text at the current X and Y coordinates.
                _DrawingContext.drawText(this.currentFont, this.currentFontSize, this.currentXPosition, this.currentYPosition, text);
                // Move the current X position.
                this.currentXPosition = this.currentXPosition + offset;
            }
        };
        // Works the same was as putText but sets x pos before drawing the blank rect
        Console.prototype.deleteText = function (text) {
            // Draws a blank rectangle at the position of the current
            if (text !== "") {
                if (this.currentXPosition <= 0) {
                    this.retreatLine();
                }
                var offset = _DrawingContext.measureText(this.currentFont, this.currentFontSize, text);
                // Must update current x pos for next chr input
                this.currentXPosition = this.currentXPosition - offset;
                // Height of rectangle is irrelevant because there will never be text beneath the current location
                _DrawingContext.clearRect(this.currentXPosition, this.currentYPosition - this.currentFontSize, offset, offset * 5);
            }
        };
        Console.prototype.advanceLine = function () {
            this.currentXPosition = 0;
            /*
             * Font size measures from the baseline to the highest point in the font.
             * Font descent measures from the baseline to the lowest point in the font.
             * Font height margin is extra spacing between the lines.
             */
            this.currentYPosition += _DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin;
            // TODO: Handle scrolling. (iProject 1)
            this.scrollCanvas();
        };
        Console.prototype.retreatLine = function () {
            this.currentXPosition = 0;
            // If the buffer is currently less than 60 (seems like a good start)
            // the x position must be appended by the length of the prompt ('>' by default)
            if (this.buffer.length < 100)
                this.currentXPosition += _DrawingContext
                    .measureText(this.currentFont, this.currentFontSize, _OsShell.promptStr);
            for (var idx = 0; idx < this.buffer.length; idx++) {
                this.currentXPosition += _DrawingContext.measureText(this.currentFont, this.currentFontSize, this.buffer.charAt(idx));
            }
            this.currentYPosition -= (_DefaultFontSize +
                _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                _FontHeightMargin);
        };
        Console.prototype.scrollCanvas = function () {
            // We will save a copy of the current canvas status, and create a new canvas with a larger height
            if (this.currentYPosition > _Canvas.height - _FontHeightMargin) {
                // Copies current canvas state to new canvas
                var canvasCopy = document.getElementById("hidden_canvas");
                canvasCopy.height = _Canvas.height;
                canvasCopy.width = _Canvas.width;
                var canvasContextCopy = canvasCopy.getContext('2d');
                canvasContextCopy.drawImage(_Canvas, 0, 0);
                // Clears original Canvas and increases height by 500.
                _DrawingContext.clearRect(0, 0, _Canvas.width, _Canvas.height);
                _Canvas.height += (2 * (_DefaultFontSize +
                    _DrawingContext.fontDescent(this.currentFont, this.currentFontSize) +
                    _FontHeightMargin));
                _DrawingContext.drawImage(canvasCopy, 0, 0);
                _Canvas.parentElement.scroll(this.currentXPosition, this.currentYPosition);
            }
        };
        return Console;
    }());
    TSOS.Console = Console;
})(TSOS || (TSOS = {}));
