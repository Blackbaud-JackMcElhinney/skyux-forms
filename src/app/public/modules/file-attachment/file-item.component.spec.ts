import {
  TestBed,
  ComponentFixture,
  async
} from '@angular/core/testing';

import {
  expect
} from '@skyux-sdk/testing';

import {
  SkyFileAttachmentsModule
} from './file-attachments.module';

import {
  SkyFileItemComponent
} from './file-item.component';

import {
  SkyFileItem
} from './file-item';

import {
  SkyFileLink
} from './file-link';

import {
  By
} from '@angular/platform-browser';

describe('File item component', () => {
  let fixture: ComponentFixture<SkyFileItemComponent>;
  let componentInstance: SkyFileItemComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        SkyFileAttachmentsModule
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SkyFileItemComponent);
    componentInstance = fixture.componentInstance;
  });

  //#region helper functions
  function getNameEl() {
    return fixture.debugElement.query(By.css('.sky-file-item-title .sky-file-item-name strong'));
  }

  function getSizeEl() {
    return fixture.debugElement.query(By.css('.sky-file-item-title .sky-file-item-size'));
  }

  function triggerDelete() {
    let deleteEl = fixture.debugElement.query(By.css('.sky-file-item-btn-delete'));
    deleteEl.nativeElement.click();
    fixture.detectChanges();
  }

  function getImage() {
    return fixture.debugElement.query(By.css('.sky-file-item-preview-img-container img'));
  }

  function getOtherPreview() {
    return fixture.debugElement.query(By.css('.sky-file-item-preview-other i'));
  }

  function testImage(extension: string) {
    componentInstance.fileItem = <SkyFileItem> {
      file: {
        name: 'myFile.' + extension,
        type: 'image/' + extension,
        size: 1000
      },
      url: 'myFile.' + extension
    };

    fixture.detectChanges();

    let imageEl = getImage();
    expect(imageEl.nativeElement.getAttribute('src')).toBe('myFile.' + extension);

    let otherEl = getOtherPreview();
    expect(otherEl).toBeFalsy();

    // Test Accessibility
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  }

  function testOtherPreview(extension: string, type: string) {
    componentInstance.fileItem = <SkyFileItem> {
      file: {
        name: 'myFile.' + extension,
        type:  type + '/' + extension,
        size: 1000
      },
      url: 'myFile.' + extension
    };
    fixture.detectChanges();
    let otherEl = getOtherPreview();
    let expectedClassExtension = type;

    if (extension === 'gz' || extension === 'rar' || extension === 'tgz' || extension === 'zip') {
      expectedClassExtension = 'archive';
    } else if (extension === 'ppt' || extension === 'pptx') {
      expectedClassExtension = 'powerpoint';
    } else if (extension === 'doc' || extension === 'docx') {
      expectedClassExtension = 'word';
    } else if (extension === 'xls' || extension === 'xlsx') {
      expectedClassExtension = 'excel';
    } else if (extension === 'txt') {
      expectedClassExtension = 'text';
    } else if (extension === 'htm' || extension === 'html') {
      expectedClassExtension = 'code';
    }
    expect(otherEl.nativeElement.classList).toContain('fa-file-' + expectedClassExtension + '-o');

    let imageEl = getImage();
    expect(imageEl).toBeFalsy();

    // Test Accessibility
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  }
  //#endregion

  it('shows the name and size if the item is a file', () => {

    componentInstance.fileItem = <SkyFileItem>{
      file: {
        name: 'myFile.txt',
        size: 1000
      }
    };
    fixture.detectChanges();

    let nameEl = getNameEl();

    expect(nameEl.nativeElement.textContent).toBe('myFile.txt');

    let sizeEl = getSizeEl();
    expect(sizeEl.nativeElement.textContent).toContain('(1 KB)');
  });

  it('shows the url if the item is a link', () => {

    componentInstance.fileItem = <SkyFileLink>{
      url: 'myFile.txt'
    };

    fixture.detectChanges();

    let nameEl = getNameEl();

    expect(nameEl.nativeElement.textContent).toBe('myFile.txt');

    let sizeEl = getSizeEl();
    expect(sizeEl).toBeFalsy();

    // Test Accessibility
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  });

  it('emits the delete event when the delete button is clicked', () => {
    componentInstance.fileItem = <SkyFileLink>{
      url: 'myFile.txt'
    };
    let deletedItem: SkyFileLink;

    componentInstance.deleteFile.subscribe(
      (newDeletedFile: SkyFileLink) => deletedItem = newDeletedFile );

    fixture.detectChanges();
    triggerDelete();

    expect(deletedItem.url).toBe('myFile.txt');

    componentInstance.fileItem = <SkyFileItem>{
      file: {
        name: 'myFile.txt',
        size: 1000,
        type: 'file/txt'
      }
    };

    let deletedFile: SkyFileItem;

    componentInstance.deleteFile.subscribe(
      (newDeletedFile: SkyFileItem) => deletedFile = newDeletedFile );
    fixture.detectChanges();

    triggerDelete();

    expect(deletedFile.file.name).toBe('myFile.txt');
    expect(deletedFile.file.size).toBe(1000);
  });

  it('shows an image if the item is an image', () => {
    testImage('png');
    testImage('bmp');
    testImage('jpeg');
    testImage('gif');
  });

  it('shows a file icon with the proper extension if it is not an image', () => {
    testOtherPreview('pdf', 'pdf');
    testOtherPreview('gz', 'gz');
    testOtherPreview('rar', 'rar');
    testOtherPreview('tgz', 'tgz');
    testOtherPreview('zip', 'zip');
    testOtherPreview('ppt', 'ppt');
    testOtherPreview('pptx', 'pptx');
    testOtherPreview('doc', 'doc');
    testOtherPreview('docx', 'docx');
    testOtherPreview('xls', 'xls');
    testOtherPreview('xlsx', 'xlsx');
    testOtherPreview('txt', 'txt');
    testOtherPreview('htm', 'htm');
    testOtherPreview('html', 'html');
    testOtherPreview('mp3', 'audio');
    testOtherPreview('tiff', 'image');
    testOtherPreview('other', 'text');
    testOtherPreview('mp4', 'video');
  });

  it('should pass accessibility', async(() => {
    componentInstance.fileItem = <SkyFileItem>{
      file: {
        name: 'myFile.txt',
        size: 1000
      }
    };
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(fixture.nativeElement).toBeAccessible();
    });
  }));

});
