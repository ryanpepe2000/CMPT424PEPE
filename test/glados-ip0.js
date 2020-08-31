//
// glados.js - It's for testing. And enrichment.
//

function Glados() {
   this.version = 2112;

   this.init = function() {
      var msg = "Hello Peasant. Let's begin project Zero .\n";
      msg += "It is your last opportunity to reconsider the testing this project, as it may onset immense pain and turmoil. ";
      msg += "Live long and prosper.";
      alert(msg);
   };

   this.afterStartup = function() {

      // Test the 'help' command.
      _KernelInputQueue.enqueue('h');
      _KernelInputQueue.enqueue('e');
      _KernelInputQueue.enqueue('l');
      _KernelInputQueue.enqueue('p');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);
      
      // Test the 'ver' command.
      _KernelInputQueue.enqueue('v');
      _KernelInputQueue.enqueue('e');
      _KernelInputQueue.enqueue('r');
      TSOS.Kernel.prototype.krnInterruptHandler(KEYBOARD_IRQ, [13, false]);

   };
}