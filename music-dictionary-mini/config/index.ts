// E:\work\ouchnmi\music-dictionary\music-dictionary-mini\config\index.ts
import type { UserConfigExport } from '@tarojs/cli';

// 直接导出配置对象，无需 defineConfig 包裹
const config: UserConfigExport = {
  projectName: 'music-dictionary-mini', // 你的项目名
  date: '2024-01-01',
  designWidth: 750, // 设计稿宽度
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: `dist/${process.env.TARO_ENV}`,
  framework: 'react', // 或 react/nerv，根据项目实际技术栈调整
  compiler: 'webpack5',
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false, // 按需开启
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  },
  h5: {
    devServer: {
      port: 3000
    },
    postcss: {
      autoprefixer: {
        enable: true,
        config: {}
      },
      cssModules: {
        enable: false,
        config: {
          namingPattern: 'module',
          generateScopedName: '[name]__[local]___[hash:base64:5]'
        }
      }
    }
  }
};

export default config;