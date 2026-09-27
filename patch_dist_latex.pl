#!/usr/bin/perl
# ⚠️ 已弃用（2026-09-27）：构建链第三步已改用 Node 版 `patch_dist_latex.mjs`。
#    原因：本机沙箱 PATH 里没有 perl（perl 实际在 C:/Program Files/Git/usr/bin/perl.exe），
#    导致"本地验证只跑前两步"，漏掉本步会产出公式静默损坏的产物。
#    本文件保留仅作对照/回退；两者输出逐字节等价（md5 相同，已实测）。
#    另：本 perl 版**不幂等** —— 重复执行会把反斜杠二次折半、弄坏公式；
#    新的 mjs 版带四连守卫，重复执行是 no-op。
use strict;
use warnings;

my $file;
if (@ARGV) {
    $file = $ARGV[0];
} else {
    # Auto-detect the main Vite bundle in dist/assets/index-*.js
    my @candidates = glob('dist/assets/index-*.js');
    die "No dist/assets/index-*.js bundle found.\n" unless @candidates;
    die "Multiple dist/assets/index-*.js bundles found: @candidates\n" if @candidates > 1;
    $file = $candidates[0];
}

open(my $fh, '<', $file) or die "Cannot read $file: $!";
my $content = do { local $/; <$fh> };
close($fh);

my $original = $content;

# Replace four backslashes with two inside latex:"..." string literals.
# The Vite/React build in this project currently doubles backslashes in
# MathBlock latex props, producing \\\\frac in the bundle. KaTeX then sees
# \\frac as a line-break command plus literal text. Halving the backslashes
# inside these strings gives the correct runtime LaTeX \frac, \pi, etc.
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
