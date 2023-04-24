import { DocumentInfo, DocumentInfoDocument, useUpdateDocumentInfoMutation } from 'graphql/generated/generated-types';
import React, { FormEvent, useState } from 'react';
import { Input } from 'components/core/Input';

export interface UpdateDocumentInfoProps {
  documentInfo: DocumentInfo;
  handleCancelClick: () => void;
}
const UpdateDocumentInfo = ({ documentInfo, handleCancelClick }: UpdateDocumentInfoProps) => {
  const [name, setName] = useState(documentInfo.name);
  const [url, setUrl] = useState(documentInfo.url);
  const [type, setType] = useState(documentInfo.type);
  const [xpath, setXpath] = useState(documentInfo.xpath);
  const [branch, setBranch] = useState(documentInfo.branch);

  const [updateDocumentInfoMutation] = useUpdateDocumentInfoMutation({
    variables: { id: documentInfo.id, name, url, type, xpath, branch },
    refetchQueries: [{ query: DocumentInfoDocument, variables: { id: documentInfo.id } }],
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateDocumentInfoMutation();
    handleCancelClick();
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="w-full">
                  <div className="mb-4">
                    <Input modelValue={name} onChange={(e) => setName(e.target.value)} label={'Name'} required={true} />
                  </div>
                  <div className="mb-4">
                    <Input modelValue={url} onChange={(e) => setName(e.target.value)} label={'Url'} required={true} />
                  </div>
                  <Input modelValue={type} onChange={(e) => setName(e.target.value)} label={'Type'} required={true} />
                  <div className="mb-4">
                    <Input modelValue={xpath || ''} onChange={(e) => setName(e.target.value)} label={'xPath'} />
                  </div>
                  <div className="mb-4">
                    <Input modelValue={branch || ''} onChange={(e) => setName(e.target.value)} label={'Branch'} />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Save
              </button>
              <button
                onClick={handleCancelClick}
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateDocumentInfo;
