# node_web_server

This project shows how to use special comment markers in JavaScript and HTML to define variables or constants. These markers can be processed later to generate actual variable or constant declarations in your code.

## Example

```html
<!-- var(username) -->"Alice"<!-- end -->
<script>
    var userEmail = /* var(userEmail) */"alice@example.com"/* end */
    console.log(userEmail)
</script>

<!-- const(apiKey) -->"12345-ABCDE"<!-- end -->
<script>
    const authToken = /* const(authToken) */"token-xyz"/* end */
    // These constants will be extracted and stored in config.js as JSON
</script>
```

## How It Works

- **Variable placeholders:**  
  - HTML: `<!-- var(username) -->"Alice"<!-- end -->`
  - JS: `/* var(userEmail) */"alice@example.com"/* end */`
- **Constant placeholders:**  
  - HTML: `<!-- const(apiKey) -->"12345-ABCDE"<!-- end -->`
  - JS: `/* const(authToken) */"token-xyz"/* end */`
- A script parses these comments and generates real variable or constant declarations.
- **Constants** are typically saved as JSON in `/user/config/config.js`.
- **Variables** can be used for HTML text generation.

## Usage

1. Write variables or constants using the special comment syntax.
2. Run the processing tool to convert comments into real code.
3. Use the generated variables/constants in your application.

## Purpose

This approach is useful for:
- Code generation
- Templating
- Configuration injection

It helps keep configuration and code separate, making your application more flexible and maintainable.
