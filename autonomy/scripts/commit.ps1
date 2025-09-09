param([string]$msg="chore(shaunai): auto")
cd ..; git add content outreach tasks/done.md autonomy/shaunai.log; git commit -m $msg; git push
