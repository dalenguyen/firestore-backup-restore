# Change log

> **Tags:**
>
> - :boom: [Breaking Change]
> - :eyeglasses: [Spec Compliancy]
> - :rocket: [New Feature]
> - :bug: [Bug Fix]
> - :memo: [Documentation]
> - :nail_care: [Polish]

---

## [1.3.0] - 2022-10-09

#### - :nail_care: [Polish]

- turn the package to use es module
- update packages

## [1.2.1] - 2022-08-24

#### - :nail_care: [Polish]

- utilize pnpm instead of yarn

## [1.2.0] - 2022-06-27

#### - :rocket: [New Feature]

- Add support for nested object & array, array of nested object (thanks, @Llolow)

#### - :nail_care: [Polish]

- update packages

## [1.1.0] - 2021-03-25

#### - :nail_care: [Polish]

- update readme (thanks, @h1r0mu)
- refactor code
- potential fix for #128

## [1.0.1] - 2021-03-20

#### - :nail_care: [Polish]

- update packages
- potential fix for #128 (google-gax timeout error)

## [1.0.0] - 2021-03-13

#### - :rocket: [New Feature]

- Backup in parallel (Thanks, @CoachBenedetto)

#### - :nail_care: [Polish]

- upgrade to new firebase-admin methods

#### - :boom: [Breaking Change]

- default initialize app to initializeFirebaseApp

## [0.18.0] - 2021-03-04

#### - :nail_care: [Polish]

- update packages

## [0.17.0] - 2021-09-09

#### - :nail_care: [Polish]

- prevented runtime error when exported document has only sub-collections (#117 thank @asankha)
- updated ci
- updated packages

## [0.16.0] - 2021-07-24

#### - :rocket: [New Feature]

- Adds backupFromDoc function to backup the document and subcollections (thank @davidbrenner)

#### - :nail_care: [Polish]

- Checked for empty subCollection
- Applied generic type
- Updated packages

## [0.15.0] - 2021-05-14

#### - :rocket: [New Feature]

- Added "autoParseGeos" option (Thanks @wata)

#### - :nail_care: [Polish]

- Updated packages

## [0.14.0] - 2021-03-25

#### - :rocket: [New Feature]

- Added firestore settings (Thanks @raqso)

#### - :nail_care: [Polish]

- Updated packages

#### - :boom: [Breaking Change]

- use showLogs as options for showing console logs

## [0.13.0] - 2021-03-12

#### - :nail_care: [Polish]

- Updated packages
- Updated types for restore / backup options (Thanks @jdepoix)

## [0.12.1] - 2020-02-26

#### - :bug: [Bug Fix]

- Added validation for document reference #84

## [0.12.0] - 2020-02-26

#### - :rocket: [New Feature]

- Added ability to query collections before backup #90 (Thanks @jdepoix)
- Added option to silence logs on import #89 (Thanks @Joebayld)

## [0.11.0] - 2020-02-21

#### - :rocket: [New Feature]

- Added support for nested document ref when backing up

## [0.10.0] - 2021-01-28

#### - :nail_care: [Polish]

- Updated packages
- Fixed typos (Thanks @ajonp & @sampl)

## [0.9.0] - 2020-12-06

#### - :rocket: [New Feature]

- Added support for reference path (Thank @russellr922)

#### - :boom: [Breaking Change]

- Removed databaseURL from parameter when initalizeApp
- Moved docsFromEachCollection to export options

#### - :nail_care: [Polish]

- Updated packages

## [0.8.0] - 2020-09-15

#### - :rocket: [New Feature]

- Added Automatic Timestamp Parsing (Thank @benwinding)

#### - :nail_care: [Polish]

- Updated firebase-admin packages (9.2.0)

## ## [0.7.0] - 2020-09-04

#### - :rocket: [New Feature]

- Support exporting single document from each collection (#63) - Thank @benwinding

#### - :nail_care: [Polish]

- Updated packages
- Minified helper functions

## ## [0.6.1] - 2020-07-02

#### - :bug: [Bug Fix]

- Allowed null dates (#56)
- Added export multiple sub collections (#57)

#### - :nail_care: [Polish]

- Added contributing file

## [0.6.0] - 2020-05-26

#### - :nail_care: [Polish]

- Updated new pacakges
- Added support for nested geo #47

## [0.5.0] - 2020-04-05

#### - :nail_care: [Polish]

- Updated new pacakges
- Added name parameter when initializing app #27

## [0.4.0] - 2020-03-19

#### - :rocket: [New Feature]

- Supported import array of locations

## [0.3.4] - 2020-03-17

#### - :nail_care: [Polish]

- Update new packages
- Fixed security package: minimist

#### - :rocket: [New Feature]

- Supported import array of references
- Supported multi sub collections

## [0.3.3] - 2020-03-10

#### - :nail_care: [Polish]

- Update new packages
- Check app before initializing

#### - :boom: [Breaking Change]

- Changed options for date & location & ref

#### - :rocket: [New Feature]

- Added support reference type
- Added upload array of document feature (without predefined document id)

## [0.3.2] - 2020-01-03

#### - :rocket: [New Feature]

- Get data with all sub collectiosn with extra params

#### - :nail_care: [Polish]

- Updated packages

## [0.3.1] - 2019-11-11

#### - :bug: [Bug Fix]

- Allow multi level time #33

## [0.3.0] - 2019-11-11

#### - :nail_care: [Polish]

- Update packages
- Added change log

#### - :rocket: [New Feature]

- Support time import max to two levels
