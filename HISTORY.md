# Release notes
All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

### 0.5.1

- Fix: cleanup when component is unmounted

### 0.5.0

- Add option `withContext: boolean` for passing the context to the `isFetchNeeded` and `mapPropsToPromise`.

### 0.4.0

- **Breaking:** Signature of `Aqueduc.connect` changed. The map is now split in to arguments: `isFetchNeeded` and `mapPropsToPromise`.

### 0.3.0

- **Breaking:** Signature of the cleanup callback has changed. The result of the promise is passed as first argument, and props as second.

### 0.2.0

- Add second argument `cleanup` to `Aqueduc.connect` to cleanup resources after rendering (client or server).

### 0.1.0

- First release 🌈
