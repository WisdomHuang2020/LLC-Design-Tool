#!/usr/bin/perl
use strict;
use warnings;

my $file = 'src/pages/Derivations.tsx';
open(my $fh, '<:encoding(UTF-8)', $file) or die "Cannot open $file: $!";
local $/;
my $content = <$fh>;
close($fh);

# Replace backslash-space-backslash-backslash-text with space-backslash-backslash-text
# In source: \ \text ->  \text
$content =~ s/ \\ \\text/ \\text/g;

open(my $out, '>:encoding(UTF-8)', $file) or die "Cannot write $file: $!";
print $out $content;
close($out);

print "Fixed space-text escaping\n";
