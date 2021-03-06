# File Properties Viewer

This is an extension for [Visual Studio Code](https://code.visualstudio.com/) which adds a command and related context menu entries for displaying file system properties of a given file. It shows file size and timestamps like the creation date.

## Features

The command can be invoked via command palette, keyboard shortcut or from either the tab context menu, or the project explorer file context menu.

A view like this will be opened for the respective file:

![Example output](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/example.png)

Additional information can be provided by the following applications:

- [`xdg-mime`](https://www.freedesktop.org/wiki/Software/xdg-utils) - Queries the MIME type.
- [`mediainfo`](https://mediaarea.net/en/MediaInfo) - Queries media information of images, audio and video.

If the applications are available in the `PATH`, they will be called unless they are explicitly disabled via the settings. See the [installation on Windows section](#installing-utility-applications-on-windows) for some help with setting that up.

## Extension Settings

This extension has the following settings:

- `filePropertiesViewer.dateTimeFormat`: Sets a custom date/time format for the timestamps.
- `filePropertiesViewer.queryMediaInfo`: Whether media information via mediainfo should be requested.
- `filePropertiesViewer.queryMIME`: Whether MIME information via xdg-mime should be requested.
- `filePropertiesViewer.outputStylePath`: Sets a path to a CSS file used for styling the output table.<br/>
    The default style can be found [here](https://github.com/brunnerh/file-properties-viewer/blob/master/./styles/default.css).<br/>
    The following classes are used within the table:
    - `copy-button`: Used on the copy button. Has an `svg` as immediate child.
    - `column-header-row`: The very top row.
      - `column-header-cell`: Cells in top row.
    - `property-row`: Row with property and value.
      - `key-cell`: Cell in property column.
      - `value-cell`: Cell of value column.
      - `indent-<n>`: Defined on property cell, number `<n>` increases for nested property rows.
    - `group-row`: Top level group row (e.g. `Media Info`).
      - `group-cell`: Cell of group row (spans both columns).
    - `sub-group-row`: Second level group row (e.g. `Media Info` > `Image`)
      - `sub-group-cell`: Cell of sub-group row (spans both columns).

## Installing Utility Applications on Windows

### MediaInfo

1. Download the **CLI** for the respective architecture from the [Windows download section](https://mediaarea.net/en/MediaInfo/Download/Windows):<br/>
   ![MediaInfo download options](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/mediainfo-download.png)
2. Extract the archive to a directory and copy its location from the address bar of the explorer. The directory should contain the `MediaInfo.exe` application:<br/>
   ![Getting the MediaInfo path](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/mediainfo-get-path.png)
3. Add the copied location to the `PATH` environment variable. (See [respective subsection](#adding-directories-to-the-path-environment-variable).)

### xdg-mime

The `xdg-mime` application is part of the `xdg-utils`. There does not appear to be a commonly available distribution for Windows (it may not even be compatible).

You could try getting a [release from the repository](https://github.com/freedesktop/xdg-utils/releases) and build it from source.

### Adding directories to the `PATH` environment variable

The `PATH` variable is used by the operating system to resolve names of executables if no absolute or relative path is provided. It is a semi-colon separated list of directories in which the operating system will look for applications.

Depending on the version of Windows this process can differ. Search online if this outline is not helpful to you; there exist guides for all versions (and other languages).

1. Search for "environment variables" from the start menu. There should be an option to change those for the current user.<br/>
   ![Control panel option for environment variables](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/path-env-settings.png)
2. In the list of variables for your user find the one called `Path` (casing does not matter). Create it if it does not exist, click "Edit" otherwise.<br/>
   ![Environment variables dialog](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/path-env-dialog.png)
3. Click the "New" button to add a new directory path to the variable. Paste or type the directory location you want to add.<br/>
   ![Path edit dialog](https://github.com/brunnerh/file-properties-viewer/raw/master/./readme-files/path-env-edit-path.png)
4. "OK" all the dialogs.
5. Restart VS Code to have it load the updated variable.