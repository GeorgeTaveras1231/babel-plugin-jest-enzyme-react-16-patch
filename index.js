const protectedNodes = new WeakSet();

const ast = {
  jestMockReplaceModule: (t, fromPath, toPath) =>
    t.expressionStatement(
      t.callExpression(
        t.memberExpression(t.identifier('jest'), t.identifier('mock')),
        [
          t.stringLiteral(fromPath),
          t.arrowFunctionExpression(
            [],
            t.callExpression(t.identifier('require'), [
              t.stringLiteral(toPath),
            ]),
          ),
        ],
      ),
    ),
};
module.exports = (context) => {
  const { types: t } = context;
  return {
    visitor: {
      ImportDeclaration: (nodePath) => {
        if (protectedNodes.has(nodePath.node)) {
          return;
        }

        const importPath = nodePath.get('source.value').node;

        if (
          importPath === 'enzyme'
        ) {
          const enzymeReact16AdapterIdentifier =
            nodePath.scope.generateUidIdentifier('React16Adapter');
          const enzymeConfigureIdentifier =
            nodePath.scope.generateUidIdentifier('configureEnzyme');

          const newEnzymeImportDeclaration = t.importDeclaration(
            [
              t.importSpecifier(
                enzymeConfigureIdentifier,
                t.identifier('configure'),
              ),
            ],
            t.stringLiteral('enzyme'),
          );

          // Avoid re-processing node since it matches the pattern we are looking for
          protectedNodes.add(newEnzymeImportDeclaration);

          nodePath.insertAfter([
            newEnzymeImportDeclaration,

            t.importDeclaration(
              [t.importDefaultSpecifier(enzymeReact16AdapterIdentifier)],
              t.stringLiteral('enzyme-adapter-react-16'),
            ),

            t.expressionStatement(
              t.callExpression(enzymeConfigureIdentifier, [
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('adapter'),
                    t.newExpression(enzymeReact16AdapterIdentifier, []),
                  ),
                ]),
              ]),
            ),
            ast.jestMockReplaceModule(t, 'react', 'react-16'),
            ast.jestMockReplaceModule(t, 'react-dom', 'react-dom-16'),
            ast.jestMockReplaceModule(
              t,
              'react-dom/test-utils',
              'react-dom-16/test-utils',
            ),
          ]);
        }
      },
    },
  };
};
