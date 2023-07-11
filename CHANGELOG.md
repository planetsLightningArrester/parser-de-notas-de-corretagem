# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.8.12] - 2023-07-11
### Changed
- Update assets list

## [0.8.11] - 2023-07-09
### Changed
- Update assets list

## [0.8.10] - 2023-07-08
### Changed
- Update assets list

## [0.8.9] - 2023-07-07
### Changed
- Update assets list

## [0.8.8] - 2023-07-06
### Changed
- Minor performance improvement
- Remove stocks being defined both in `assets.json` and manually

### Fixed
- Fix formatting

## [0.8.7] - 2023-07-06
### Changed
- Update assets list

## [0.8.6] - 2023-07-05
### Changed
- Update assets list

## [0.8.5] - 2023-07-04
### Fixed
- Fix assets history overwriting previous corporative events

### Changed
- Update assets list

## [0.8.4] - 2023-07-04
### Changed
- Update assets list

## [0.8.3] - 2023-07-03
### Changed
- Update assets list

## [0.8.2] - 2023-07-03
### Changed
- Update assets list

## [0.8.1] - 2023-07-03
### Fixed
- Fix assets without corporative events not included in `assets.json`
- Fix sells without fixed numbers

### Changed
- Update assets list

## [0.8.0] - 2023-07-02
### Added
- Add support for Inter notes but requires more tests

### Changed
- Update assets list

## [0.7.23] - 2023-07-02
### Changed
- Update assets list

## [0.7.22] - 2023-07-01
### Changed
- Update assets list

## [0.7.21] - 2023-06-30
### Changed
- Update assets list

## [0.7.20] - 2023-06-29
### Changed
- Update assets list

## [0.7.19] - 2023-06-28
### Changed
- Update assets list

## [0.7.18] - 2023-06-27
### Changed
- Update assets list

## [0.7.17] - 2023-06-25
### Changed
- Update assets list

## [0.7.16] - 2023-06-23
### Changed
- Update assets list

## [0.7.15] - 2023-06-22
### Changed
- Update assets list

## [0.7.14] - 2023-06-21
### Changed
- Update assets list

## [0.7.13] - 2023-06-20
### Changed
- Update assets list

## [0.7.12] - 2023-06-19
### Changed
- Update assets list

## [0.7.11] - 2023-06-18
### Changed
- Update assets list

## [0.7.10] - 2023-06-16
### Changed
- Update assets list

## [0.7.9] - 2023-06-15
### Changed
- Update assets list

## [0.7.8] - 2023-06-14
### Changed
- Update assets list

## [0.7.7] - 2023-06-13
### Changed
- Update assets list

## [0.7.6] - 2023-06-11
### Changed
- Update assets list

## [0.7.5] - 2023-06-09
### Changed
- Update assets list

## [0.7.4] - 2023-06-08
### Changed
- Update assets list

## [0.7.3] - 2023-06-07
### Changed
- Update assets list

## [0.7.2] - 2023-06-06
### Changed
- Update assets list

## [0.7.1] - 2023-06-05
### Changed
- Update assets list

## [0.7.0] - 2023-06-04
### Fixed
- Fix `npm run update-assets` not updating the right file

### Removed
- Change `StockDividendShortVersion` and `CashDividendShortVersion` to `StockDividend` and `CashDividend`

### Added
- `Subscription`s fields to `StockDividend` and `CashDividend`

## [0.6.1] - 2023-05-01
### Fixed
- Fix `npm run update-assets` file not found

## [0.6.0] - 2023-04-30
### Changed
- Add field `approvedOn` to `StockDividendShortVersion` and `CashDividendShortVersion`. This forced the release to lost previous asset history (1 year+) 😢

### Fixed
- Fix false duplicates were removed from `cashDividends` and `stockDividends`
- Fix update script being taken from wrong build directory

## [0.5.4] - 2023-04-30
### Changed
- Update assets list

## [0.5.3] - 2023-04-16
### Fixed
- Handle multiple `tradingCode`s (#2)

### Changed
- Arrange dividends by `lastDatePrior`
- Update assets list
- Update dependencies

## [0.5.2] - 2023-04-10
### Fixed
- `AssetCrawler` type not being exported

## [0.5.1] - 2023-04-10
### Added
- Expose `assetCrawler` field
- Add subscription to assets update
- Add verbosity level

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
