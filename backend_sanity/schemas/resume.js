export default {

    name: 'resume',
    title: 'Resume',
    type: 'document',
    fields: [{
        name: 'title',
        title: 'Title',
        type: 'string',
        description: 'Name of the resume (e.g. "Latest Resume", "Technical Resume")',
    }

        ,
    {
        name: 'description',
        title: 'Description',
        type: 'string',
        description: 'Short description about this resume version',
    }

        ,
    {
        name: 'isActive',
        title: 'Active',
        type: 'boolean',
        description: 'Set to true to make this the currently displayed resume',
    }

        ,
    {

        name: 'resumeFile',
        title: 'Resume File',
        type: 'file',
        description: 'Upload your resume PDF file',
        options: {
            accept: '.pdf'
        }
    }

        ,
    {
        name: 'uploadedAt',
        title: 'Uploaded At',
        type: 'datetime',
        description: 'When this resume was uploaded',
    }

    ]
}