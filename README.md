# Lexical paste editor


## Features


- 🔧&nbsp; **Easy Customization**: Effortlessly render custom content with straightforward customization options.

- 💪&nbsp; **TypeScript Integration**: Benefit from the advantages of [Typescript](https://www.typescriptlang.org/) for enhanced code reliability.

- 🎨&nbsp; **TailwindCSS Styling**: Achieve a sleek and modern design with styling powered by [TailwindCSS](https://tailwindcss.com/).

## Installation

Using [npm](https://npmjs.com/)

1. Install the package:

```
  npm install lexical-paste-editor
```

2. Import the timeline styles in your main JavaScript file:

```
  import "lexical-paste-editor/dist/style.css";
```

## Usage

See src/App.tsx


## `<LexicalPasteEditor/> Props`

Below are the available configuration options for the component:

| Name                | Type                           | Description                                                       |
| ------------------- | ------------------------------ | ----------------------------------------------------------------- |
| `pasteText`         | `string`                       | Text which you paste                                              |
| `onUpdateText`      | `func`                         | Returns text in HTML format                                       |
| `onUploadImage`     | `Promise`                      | Returns base64 image item which was uploaded. Return s3/GCS url   |
| `onRemoveImage`     | `Promise`                      | Returns src deleted image                                         |

## 🤝Contributing

We welcome contributions! If you find a bug or have an idea for improvement, please open an issue or submit a pull request on [Github](https://github.com/mevlutcantuna/react-beautiful-timeline).

1. [Fork it](https://github.com/kaidash)
2. Create your feature branch (`git checkout -b new-feature`)
3. Commit your changes (`git commit -am 'Add feature'`)
4. Push to the branch (`git push origin new-feature`)
5. Create a new Pull Request

## Author ✨

💻 &nbsp; NICK KAIDASH

- [LinkedIn]()
- [Github]()

## Licence

This project is licensed under the MIT License.
