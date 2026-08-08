import { defineConfig } from 'orval';
export default defineConfig({
  myApi: {
    input: 'http://localhost:8080/openapi.yaml',
    output: {
      clean: true,
      tsconfig: './tsconfig.app.json',
      target: './src/api/generated/api.ts',
      schemas: './src/api/generated/models',
      client: 'axios-functions',
      mode: 'tags',
      override: {
        mutator: {
          path: './src/api/custom-axios.ts',
          name: 'customAxios',
        },
        // 自定义生成的函数/Hook 名称
        operationName: (operation, route, verb) => {
          const id = operation.operationId || '';
          // 如果后端拼接的是 "list-article" 或 "list-user"，只截取前面的 "list"
          if (id.includes('-')) {
            return id.split('-')[0]; // 生成 list
          }
          return id;
        },
      },
    },
    hooks: {
      afterAllFilesWrite: {
        command: 'node src/api/gen-index.mjs',
        injectGeneratedDirsAndFiles: false,
      },
    },
  },
});
