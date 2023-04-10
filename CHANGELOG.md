# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2023-04-10
### Added
- Add fields `stockDividends` and `cashDividends`. It delays a lot the assets update
- Add `getDividends` to get dividends by asset

### Changed
- Increase `npm run update-assets` verbosity

## [0.4.4] - 2023-04-04
### Fixed
- Fix password not working if the first password is wrong

## [0.4.3] - 2023-04-04
### Changed
- Update pdfjs to latest
- Update dependencies

## [0.4.2] - 2023-04-04
### Fixed
- Downgrade pdfjs to fix issues with not-well-formatted PDFs

## [0.4.1] - 2023-04-04
### Fixed
- Accepted typing of `content` now can only be `Uint8Array` (`Buffer` doesn't exist in web)

### Changed
- Update assets list

## [0.4.0] - 2023-04-02
### Added
- Add field `isFII` into `Deal`

### Changed
- Accepted typing of `string` for `content` now can only be `Buffer` or `Uint8Array`
- Update assets list

## [0.3.1] - 2023-02-25
### Changed
- Fix worker error when using with React

### Removed
- Remove support for ARM

## [0.3.0] - 2023-02-25
### Changed
- Fix worker error when using with `react-testing-library`

### Removed
- Remove support for ARM

## [0.2.3] - 2023-02-22
### Changed
- Add CNPJ to FIIs

## [0.2.2] - 2023-02-22
### Changed
- Add CNPJ to some custom codes
- Update dependencies

## [0.2.1] - 2023-02-20
### Fixed
- `parseNote()` accepts both `string` and `Uint8Array`

## [0.2.0] - 2023-02-20
### Changed
- Do not handle errors

## [0.1.0] - 2023-02-19
### Changed
- `parseNote()` now accepts the note name and the note content instead of the path to the file.
Browsers can be supported this way

### Added
- It's now possible use it in the Browser (couldn't add tests though)

## [0.0.5] - 2023-02-19
### Changed
- Update dependencies
- Update assets list

## [0.0.4] - 2022-12-30
### Fixed
- Fix `CHANGELOG.md` typos

### Changed
- Update dependencies
- Update assets list

## [0.0.3] - 2022-12-03
### Added
- Add `setDateFormat` method to set dates either "dd/MM/yyyy" or "yyyy-MM-dd"

### Fixed
- Fix var name in `README.md` example

### Changed
- Update `README.md`
- Update dependencies

## [0.0.2] - 2022-09-18
### Changed
- Fix `homepage` link

## [0.0.1] - 2022-09-18
### Added
- Parse `Rico` and `Clear` holders brokerage notes