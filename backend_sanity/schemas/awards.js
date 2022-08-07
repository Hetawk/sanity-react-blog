export default {
    name: 'awards',
    title: 'Awards & Certificates',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string'
        },
        {
            name: 'company',
            title: 'Company/Organization',
            type: 'string'
        },
        {
            name: 'imgurl',
            title: 'ImgUrl',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'year',
            title: 'Year',
            type: 'string'
        }
    ]
}