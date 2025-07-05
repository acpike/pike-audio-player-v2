module.exports = {
  plugins: {
    autoprefixer: {
      // Automatically add vendor prefixes based on browserslist
      flexbox: 'no-2009', // Disable legacy flexbox for IE 10
      grid: 'autoplace'   // Enable CSS Grid autoprefixing
    }
  }
}