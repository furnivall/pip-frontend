import sinon from 'sinon';
import fs from 'fs';
import { multerFile } from '../mocks/multerFile';
import { FileHandlingService } from '../../../main/service/fileHandlingService';

const fileHandlingService = new FileHandlingService();
const validFileCase = multerFile('testFile.HtMl', 1000);
const largeFile = multerFile('testFile.docx', 3000000);
const validFile = multerFile('testFile.pdf', 1000);
const validImage = multerFile('testImage.png', 1000);
const largeImage = multerFile('testFile.png', 3000000);
const invalidFileType = multerFile('testFile.xyz', 1000);
const noFileType = multerFile('testFile', 1000);

const stub = sinon.stub(fs, 'unlinkSync');

describe('File handling service', () => {
  describe('validateImage', () => {
    it('should return null if valid image is provided', () => {
      expect(fileHandlingService.validateImage(validImage)).toBe(null);
    });

    it('should return error message if image is not provided', () => {
      expect(fileHandlingService.validateImage(null))
        .toBe('There is a problem - We will need ID evidence to support your application for an account');
    });

    it('should return error message if unsupported format image is provided', () => {
      expect(fileHandlingService.validateImage(invalidFileType))
        .toBe('There is a problem - ID evidence must be a JPG, PDF or PNG');
    });

    it('should return error message if image is over 2MB', () => {
      expect(fileHandlingService.validateImage(largeImage))
        .toBe('There is a problem - ID evidence needs to be less than 2Mbs');
    });
  });

  describe('validateFileUpload', () => {
    it('should return null when checking a valid file', () => {
      expect(fileHandlingService.validateFileUpload(validFile)).toBe(null);
    });

    it('should return null when checking file type in different case sensitivity', () => {
      expect(fileHandlingService.validateFileUpload(validFileCase)).toBe(null);
    });

    it('should return error message if file greater than 2MB', () => {
      expect(fileHandlingService.validateFileUpload(largeFile)).toEqual('File too large, please upload file smaller than 2MB');
    });

    it('should return error message if invalid file type', () => {
      expect(fileHandlingService.validateFileUpload(invalidFileType)).toEqual('Please upload a valid file format');
    });

    it('should return error message if missing file type', () => {
      expect(fileHandlingService.validateFileUpload(noFileType)).toEqual('Please upload a valid file format');
    });

    it('should return error message if no file passed', () => {
      expect(fileHandlingService.validateFileUpload(null)).toEqual('Please provide a file');
    });
  });

  describe('readFile', () => {
    it('should read a pdf file successfully', () => {
      const file = fileHandlingService.readFile('validationFile.pdf');
      expect(file).toBeInstanceOf(Buffer);
    });

    it('should read a json file successfully', () => {
      const file = fileHandlingService.readFile('validationJson.json');
      expect(file).toEqual({'name': 'this is valid json file'});
    });

    it('should return null if there is an error in reading a file', () => {
      const file = fileHandlingService.readFile('foo.pdf');
      expect(file).toEqual(null);
    });
  });

  describe('isValidFileType', () => {
    it('should return true for valid image type', () => {
      expect(fileHandlingService.isValidFileType('foo.jpg', true)).toBe(true);
    });

    it('should return false for invalid image type', () => {
      expect(fileHandlingService.isValidFileType('bar.gif', true)).toBe(false);
    });

    it('should return false for no image type', () => {
      expect(fileHandlingService.isValidFileType('buzz', true)).toBe(false);
    });

    it('should return true for valid file type', () => {
      expect(fileHandlingService.isValidFileType('foo.pdf', false)).toBe(true);
    });

    it('should return false for invalid image type', () => {
      expect(fileHandlingService.isValidFileType('bar.gif', false)).toBe(false);
    });

    it('should return false for no file type', () => {
      expect(fileHandlingService.isValidFileType('pop', false)).toBe(false);
    });
  });

  describe('isFileCorrectSize', () => {
    it('should return true if file is less than 2MB', () => {
      expect(fileHandlingService.isFileCorrectSize(1000)).toEqual(true);
    });

    it('should return false if file is greater than 2MB', () => {
      expect(fileHandlingService.isFileCorrectSize(3000000)).toEqual(false);
    });
  });

  describe('removeFile', () => {
    it('should remove a file', () => {
      expect(fileHandlingService.removeFile(validImage)).toEqual(void 0);
      stub.restore();
    });

    it('should error when failing to delete a file', () => {
      stub.restore();
      const consoleSpy = jest.spyOn(console, 'error')
        .mockImplementation(() => {'';});
      fileHandlingService.removeFile(invalidFileType);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFileExtension', () => {
    it('should return file type', () => {
      const fileType = fileHandlingService.getFileExtension('demo.pdf');
      expect(fileType).toEqual('pdf');
    });
  });
});