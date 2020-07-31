# Upload Release Asset Action

Upload several assets of a release.

## Example usage

````YML
on:
    push:
steps:
    - name: Create Release
        id: create_release
        uses: actions/create-release@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} 
        with:
          tag_name: ${{ github.ref }}
          release_name: Release ${{ github.ref }}
    - name: Upload Release Asset
      uses: nivaes/upload-release-assets@master
      env:
         GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      with:
         upload_url: ${{ steps.create_release.outputs.upload_url }}
         targets: ./**/*.nupkg

````
