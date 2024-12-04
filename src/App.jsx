import React, { useRef, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { toast, Toaster } from 'sonner';

const App = () => {
  const [editorValue, setEditorValue] = useState('');
  const [title, setTitle] = useState('');
  const [version, setVersion] = useState('');
  const [description, setDescription] = useState('');
  const [coverImg, setCoverImg] = useState(null);
  const [scheduledReleaseDate, setScheduledReleaseDate] = useState('');
  const quillRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(" ");


  const handleChange = (value) => {
    setEditorValue(value);
   
  };
  
  console.log('fdkfmdmfd', editorValue);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    if (id === 'title') setTitle(value);
    if (id === 'version') setVersion(value);
    if (id === 'description') setDescription(value);
    if (id === 'scheduledReleaseDate') setScheduledReleaseDate(value);
  };

  
  const handleFileChange = (e) => {
    setCoverImg(e.target.files[0]);
  };
  

 
  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('version', version);
    formData.append('content', editorValue);
    formData.append('description', description);
    formData.append('scheduledReleaseDate', scheduledReleaseDate);
    
    
    if (coverImg) {
      formData.append('coverImg', coverImg);
    }

    if(formData){
      createRelease(formData);
    }else{
      toast.error('payload is invalid');
    }

  };


   const createRelease = async(payload)=>{
          try{
            const response = await axios.post('http://localhost:3004/blog_api/create-release', payload);
            toast.success(response.data.message);
            console.log('sdsdsdsd',response.message);
          }catch{
              toast.error('Error while creating the release');
          } 
                    
   }
   const handleVideoUpload = async (event) => {
    const files = event.target.files;
  
    if (files && files.length > 0) {
      const container = [];
  
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileType = file.type;
  
        if (fileType.startsWith("image")) {
          const base64 = await convertFileToBase64(file);
          container.push(
            `<p><img src="${base64}" type="${fileType}" alt="uploaded-image" style="max-width: 100%;" /></p>`
          );
        } else if (fileType.startsWith("video")) {
          console.log(file);
            const videoUrl = await uploadVideo(file);
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection(); 
            editor.insertEmbed(range ? range.index : 0, "video", videoUrl);
          }
          container.push(
            `<p><video src="${videoUrl}" type="${fileType}" style="max-width: 100%;" controls></video></p>`
          );
        }
      }
  
      const previousContent = quillRef.current?.getEditor()?.root.innerHTML || "";
      const newContent = `${previousContent}${container.join(" ")}`;
      setEditorValue(newContent);
      const editor = quillRef.current?.getEditor();
      if (editor) {
        editor.root.innerHTML = newContent;
      }
    }
  };



  const uploadVideo= async(file)=>{
       const data = new FormData();
       data.append('coverImg',file);
      const response = await axios.post("http://localhost:3004/blog_api/upload-video", data, {
        headers:{
          'Content-Type': 'multipart/form-data'
        }
      });

      if(response){
        return response.data; 
      } 
      
  }
  
  

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };
  
  
  

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'], 
      ['blockquote', 'code-block'],
      [{ header: 1 }, { header: 2 }], 
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ script: 'sub' }, { script: 'super' }], 
      [{ indent: '-1' }, { indent: '+1' }], 
      [{ direction: 'rtl' }], 

      [{ size: ['small', false, 'large', 'huge'] }], 
      [{ header: [1, 2, 3, 4, 5, false] }],

      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['link', 'image', 'video'],
      ['clean'],
    ],

    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
          'background',
    'bold',
    'color',
    'font',
    'code',
    'italic',
    'link',
    'size',
    'strike',
    'script',
    'underline',
    'blockquote',
    'header',
    'indent',
    'list',
    'align',
    'direction',
    'code-block',
    'image',
    'video',
  ];
  





  return (
    <div className='w-full flex justify-center items-center h-screen bg-gray-100 overflow-y-auto'>
      <Toaster position='top-right'/>
      <div className='w-[40rem] p-8 bg-slate-200 min-h-[60rem] rounded-lg shadow-lg'>
        <form className='space-y-8' onSubmit={handleSubmit}>
          <div className='space-y-4'>
            <div>
              <label htmlFor="title" className='block text-sm font-medium text-gray-700'>
                Title:
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleInputChange}
                className='w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="version" className='block text-sm font-medium text-gray-700'>
                Version:
              </label>
              <input
                type="text"
                id="version"
                value={version}
                onChange={handleInputChange}
                className='w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="content" className='block text-sm font-medium text-gray-700'>
                Content:
              </label>
            
              <ReactQuill
                value={editorValue}
                onChange={handleChange}
                modules={modules}
                className="h-[10rem] text-gray-800 mt-2 border rounded-md"
                formats={formats}
                ref={quillRef}
              />
            </div>

            <div>
              <label htmlFor="description" className='block text-sm font-medium text-gray-700 mt-[4rem]'>
                Description:
              </label>
              <textarea
                name="description"
                id="description"
                value={description}
                onChange={handleInputChange}
                className='w-full h-[6rem] p-3 resize-none rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div>
              <label htmlFor="coverImg" className='block text-sm font-medium text-gray-700'>
                Cover Image:
              </label>
              <input
                type="file"
                id="coverImg"
                onChange={handleFileChange}
                className='w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          
          <div>
            video
          <input type="file" accept="video/*, image/*" onChange={handleVideoUpload} multiple/>
          </div>

            <div>
              <label htmlFor="releaseDate" className='block text-sm font-medium text-gray-700'>
                Release Date:
              </label>
              <input
                type="datetime-local"
                id="scheduledReleaseDate"
                value={scheduledReleaseDate}
                onChange={handleInputChange}
                className='w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
              />
            </div>
          </div>

          <div className='flex justify-end'>
            <button
              type="submit"
              className='px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300'
            >
              Submit
            </button>
          </div>
        </form>
      </div>
      {/* <video src={previewUrl} autoPlay></video> */}
    </div>
  );
};

export default App;
