# Installing Node.js Using `nvm` with `npm`

Follow these steps to install Node.js using `nvm` (Node Version Manager) and set up `npm`:

## Steps

Use `nvm` to install the desired version of Node.js:

```bash
# Download and install nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash

# In lieu of restarting the shell:
\. "$HOME/.nvm/nvm.sh"

# Download and install Node.js:
nvm install 22

# Verify the Node.js version:
node -v # Should print "v22.15.1".
nvm current # Should print "v22.15.1".

# Verify npm version:
npm -v # Should print "10.9.2".
```
