See [Using Jekyll with Pages](https://help.github.com/articles/using-jekyll-with-pages) for help with editing this content.

## Quick start

1. Verify that you have Ruby (version 1.9.3 or 2.0.0)
1. Run `gem install bundler`
1. Clone this repository and switch to the `gh-pages` branch
1. In your cloned repository, run `bundle install`
1. Run `bundle exec jekyll serve` to preview your site at
   http://localhost:4000

## Windows users

Jekyll isn't really designed with Windows in mind, but it's not too hard to
get it working with Cygwin. Follow the 'Installing Jekyll' steps on the GitHub
help page above after installing Cygwin with the following packages. If you
get errors from the `bundle install` step, you're probably missing a package
-- most likely, a `*-devel` library package. If it's not listed below, please
add it!

Required Cygwin packages:
* ruby (version 1.9.3 or 2.0.0)
* gcc-core
* libcrypt-devel
* libiconv-devel
* libffi-devel
* make
* patch
* pkg-config
* zlib-devel

Note that `bundle install` will likely take quite a while, and may appear to hang.

Even with all the required packages, Jekyll on Windows doesn't seem to like
running in `--watch` mode. This might be fixed by downgrading the `listen`
package, but doing so means downgrading many other packages and potentially
breaking compatibility.

### Troubleshooting

#### Nokogiri fails to build

This appears to be a bug related to Cygwin and certain versions of Nokogiri. As a workaround, you'll need to install a few more Cygwin packages:
* libxml2-devel
* libxslt-devel
* ruby-nokogiri

Then, run this command:
```sh
bundle config build.nokogiri --use-system-libraries
```

After this, `bundle install` will use the version of Nokogiri installed by Cygwin rather than trying to download and build a new one.

#### Permission denied

If you get "permission denied" related to `conftest.exe` while running
`bundle install`, you may need to temporarily disable your virus protection.
Remember to turn it on again after installation!

#### Jekyll fails to build your site

If Jekyll fails to build your site, you may need to provide a "fixed" version
of your `COMSPEC` environment variable. The easiest way to do that is:
```sh
export COMSPEC=`cygpath -u "$COMSPEC"`
```
You can either run that command in your shell yourself, add it to `.bashrc`,
or add it to a shell script that (for example) runs `bundle exec jekyll serve`
for you.
