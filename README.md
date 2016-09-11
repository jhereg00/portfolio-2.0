# Startup Library

This are my go-to startup files. To use, clone it and then remember to change the git origin to your new project.

## JS

The javascript relies on a modular build system, like browserify or babel.  The lib files don't actually require babel, and use CommonJS syntax for the modules.  Default scripts task for gulp uses browserify.

## SCSS

The scss is written with atomic design in mind.  The master styles.scss file includes everything else, which is separated into atomic folders.  Some commenting is present in the KSS style, although a KSS generator is not included in this library.
