/* eslint-disable */
import { Project } from 'ts-morph'

const project = new Project({
  tsConfigFilePath: 'configs/tsconfig.cjs.json'
})

project.getSourceFiles().forEach((file) => {
  file.getImportDeclarations().forEach((decl) => {
    decl.setModuleSpecifier(
      decl.getModuleSpecifier().getText().replace('.js', '.cjs').replace(/'/g, '')
    )
  })

  console.log(file.getText())
})

project.emitSync()
