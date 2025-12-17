export const thermalPrint = (html) => {
  const printFrame = window.open("", "", "width=380,height=900");

  printFrame.document.open();
  printFrame.document.write(html);
  printFrame.document.close();

  printFrame.onload = () => {
    printFrame.focus();
    printFrame.print();

    // ✅ MAX SAFE TIMEOUT (no modal hang)
    setTimeout(() => {
      printFrame.close();
    }, 400);
  };
};
