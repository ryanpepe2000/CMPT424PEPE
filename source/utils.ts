/* --------
   Utils.ts

   Utility functions.
   -------- */

module TSOS {

    export class Utils {

        public static trim(str): string {
            // Use a regular expression to remove leading and trailing spaces.
            return str.replace(/^\s+ | \s+$/g, "");
            /*
            Huh? WTF? Okay... take a breath. Here we go:
            - The "|" separates this into two expressions, as in A or B.
            - "^\s+" matches a sequence of one or more whitespace characters at the beginning of a string.
            - "\s+$" is the same thing, but at the end of the string.
            - "g" makes is global, so we get all the whitespace.
            - "" is nothing, which is what we replace the whitespace with.
            */
        }

        public static rot13(str: string): string {
            /*
               This is an easy-to understand implementation of the famous and common Rot13 obfuscator.
               You can do this in three lines with a complex regular expression, but I'd have
               trouble explaining it in the future.  There's a lot to be said for obvious code.
            */
            var retVal: string = "";
            for (var i in <any>str) {    // We need to cast the string to any for use in the for...in construct.
                var ch: string = str[i];
                var code: number = 0;
                if ("abcedfghijklmABCDEFGHIJKLM".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) + 13;  // It's okay to use 13.  It's not a magic number, it's called rot13.
                    retVal = retVal + String.fromCharCode(code);
                } else if ("nopqrstuvwxyzNOPQRSTUVWXYZ".indexOf(ch) >= 0) {
                    code = str.charCodeAt(Number(i)) - 13;  // It's okay to use 13.  See above.
                    retVal = retVal + String.fromCharCode(code);
                } else {
                    retVal = retVal + ch;
                }
            }
            return retVal;
        }

        public static hexToDec(hexVal: string): number{
            return parseInt("0x" + hexVal);
        }

        public static decToHex(decVal: number): string{
            return decVal.toString(16);
        }

        public static padHex(hexString:string, padAmt: number): string{
            if (hexString == null) return null;
            let retVal: string = hexString;
            while(retVal.length < padAmt){
                retVal = "0" + retVal;
            }
            return "0x" + retVal.toUpperCase();
        }

        public static removePad(hexString: string): number {
            let retval = hexString.replace(/^0+/g, "");
            if (retval === ""){
                return 0;
            } else return this.hexToDec(retval);
        }

        /** asciiToDiskText
         *
         * Converts ascii text to formatted ascii text for storage in disk
         *
         */
        public static asciiToDiskText(str: string, blockLength: number): string {
            let retval = "";
            for (let i = str.length; i < blockLength; i++) {
                str += "\0\0";
            }
            for (let i = 0; i < str.length; i++) {
                retval += '' + str.charCodeAt(i).toString(16);
            }
            return retval;
        }

        /**
         * diskTextToAscii
         *
         * Converts disk text to formatted ascii text
         */
        public static diskTextToAscii(diskText): string {
            let retval = "";
            for (let i = 0; i < diskText.length; i += 2) {
                let chrCode = parseInt("0x" + diskText.substr(i, 2));
                let character = (chrCode === 0) ? "0" : String.fromCharCode(chrCode);
                retval += character;
            }
            return retval;
        }
    }
}
