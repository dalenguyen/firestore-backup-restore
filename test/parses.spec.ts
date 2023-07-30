import { expect } from 'chai'
import { parseAndConvertDates, parseAndConvertGeos } from '../dist/helper'
import { GeoPoint } from 'firebase-admin/firestore'

describe('parse helpers', () => {
 it('Test auto parse dates option - simple', async () => {
    const data = {
      date: {
        _seconds: 1534046400,
        _nanoseconds: 0,
      },
    }
    parseAndConvertDates(data)
    expect(data.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested', async () => {
    const data = {
      date: {
        _seconds: 1534046400,
        _nanoseconds: 0,
      },
      obj: {
        anotherObj: {
          date: {
            _seconds: 1534046400,
            _nanoseconds: 0,
          },
        },
      },
    }
    parseAndConvertDates(data)
    expect(data.date).to.be.an.instanceOf(Date)
    expect(data.obj.anotherObj.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested arrays', async () => {
    const data = {
      arr: [
        {
          _seconds: 1534046400,
          _nanoseconds: 0,
        },
      ],
    }
    parseAndConvertDates(data)
    expect(data.arr[0]).to.be.an.instanceOf(Date)
  })

  it('Test auto parse dates option - nested array objects', async () => {
    const data = {
      arr: [
        {
          obj: {
            date: {
              _seconds: 1534046400,
              _nanoseconds: 0,
            },
          },
        },
        {
          obj: {
            date: {
              _seconds: 1534046400,
              _nanoseconds: 0,
            },
          },
        },
      ],
    }
    parseAndConvertDates(data)
    expect(data.arr[0].obj.date).to.be.an.instanceOf(Date)
    expect(data.arr[1].obj.date).to.be.an.instanceOf(Date)
  })

  it('Test auto parse geos option - simple', async () => {
    const data = {
      location: {
        _latitude: 35.687498354666516,
        _longitude: 139.44018328905466,
      },
    }
    parseAndConvertGeos(data)
    expect(data.location).to.be.an.instanceOf(GeoPoint)
  })

  it('Test auto parse geos option - nested', async () => {
    const data = {
      location: {
        _latitude: 35.687498354666516,
        _longitude: 139.44018328905466,
      },
      obj: {
        anotherObj: {
          location: {
            _latitude: 35.687498354666516,
            _longitude: 139.44018328905466,
          },
        },
      },
    }
    parseAndConvertGeos(data)
    expect(data.location).to.be.an.instanceOf(GeoPoint)
    expect(data.obj.anotherObj.location).to.be.an.instanceOf(GeoPoint)
  })

  it('Test auto parse geos option - nested arrays', async () => {
    const data = {
      arr: [
        {
          _latitude: 35.687498354666516,
          _longitude: 139.44018328905466,
        },
      ],
    }
    parseAndConvertGeos(data)
    expect(data.arr[0]).to.be.an.instanceOf(GeoPoint)
  })

  it('Test auto parse geos option - nested array objects', async () => {
    const data = {
      arr: [
        {
          obj: {
            location: {
              _latitude: 35.687498354666516,
              _longitude: 139.44018328905466,
            },
          },
        },
        {
          obj: {
            location: {
              _latitude: 35.687498354666516,
              _longitude: 139.44018328905466,
            },
          },
        },
      ],
    }
    parseAndConvertGeos(data)
    expect(data.arr[0].obj.location).to.be.an.instanceOf(GeoPoint)
    expect(data.arr[1].obj.location).to.be.an.instanceOf(GeoPoint)
  })
})