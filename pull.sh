git config core.sparseCheckout true

git remote add eventstorming https://source.developers.google.com/p/eventstorming-tool/r/eventstorming-ui-dev

git fetch eventstorming master

echo "src/utils/" >> .git/info/sparse-checkout
echo "src/components/oauth" >> .git/info/sparse-checkout
echo "src/components/opengraph" >> .git/info/sparse-checkout
echo "src/components/CommonStorageBase.vue" >> .git/info/sparse-checkout
echo "src/components/SeparatePanelComponents.vue" >> .git/info/sparse-checkout
echo "src/components/designer/modeling" >> .git/info/sparse-checkout
echo "src/components/designer/k8s-modeling" >> .git/info/sparse-checkout

#git pull eventstorming master #--allow-unrelated-histories
git merge -Xours eventstorming/master --allow-unrelated-histories

git config core.sparseCheckout false
