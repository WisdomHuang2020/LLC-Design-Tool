#!/usr/bin/perl
use strict;
use warnings;

my $file = $ARGV[0] || 'dist/assets/index-DmUJCYoB.js';
open(my $fh, '<', $file) or die "Cannot read $file: $!";
my $content = do { local $/; <$fh> };
close($fh);

my $original = $content;

# Replace four backslashes with two inside latex:"..." string literals.
# In Perl source here, the regex /\\\\/ matches two literal backslashes,
# and the replacement \\ produces one literal backslash. We want to turn
# the bundle's "\\\\frac" (four backslashes, runtime value "\\frac")
# into "\\frac" (two backslashes, runtime value "\frac").
$content =~ s{(latex:")((?:[^"\\]|\\.)*)(")}{
    my ($pre, $body, $post) = ($1, $2, $3);
    $body =~ s/\\\\/\\/g;
    $pre . $body . $post
}ge;

if ($content eq $original) {
    print "No changes made.\n";
    exit 0;
}

open(my $out, '>', $file) or die "Cannot write $file: $!";
print $out $content;
close($out);

print "Patched $file\n";
