# Preview Markdown Synchronization

This action previews the synchronization result by displaying the whole Notion page architecture that will be created from your markdown files or directories.

---

## Documentation

### Inputs

- `input` - The path to the markdown file or directory to synchronize
- `format` - The format of the preview ("plainText" or "json")
- `output` - The path to the output file (optional)

### Outputs

- `file-path` - The path to the output file (only set when output is specified)

## Usage

```yaml
steps:
  - name: Checkout repository
    uses: actions/checkout@v4

  - name: Preview markdown synchronization
    uses: Myastr0/mk-notes/preview@v1
    with:
      input: './docs' # The path to the markdown file or directory to preview
      format: 'plainText' # The format of the preview ("plainText" or "json")
      output: './preview.txt' # Optional: path to save the preview
```

## Going further

Please refer to the [Mk Notes documentation](https://docs.mk-notes.io) for more information.

## License

This action is licensed under the same terms as the mk-notes project.
